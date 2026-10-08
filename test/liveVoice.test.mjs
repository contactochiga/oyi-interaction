import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
import { createOyiLiveVoiceSession, OyiLiveVoiceHub, OyiComposer, OyiShell } from '../dist/index.js';
const tick = () => new Promise(r => setImmediate(r));
function fixture({ available = true, reject = false } = {}) {
  let inputState = { available, status:'idle', finalTranscript:'', interimTranscript:'' }, listener;
  let speechStart, speechEnd, deliver;
  const calls = [];
  const input = { getSnapshot:()=>inputState, subscribe:fn=>{listener=fn;return()=>{listener=null;}}, startListening:()=>calls.push('listen'), cancelListening:()=>calls.push('cancel') };
  const output = { available, cancel:()=>calls.push('silence'), speak:(text,start)=>{calls.push(text);speechStart=start;return new Promise(r=>{speechEnd=r;});} };
  const session = createOyiLiveVoiceSession({input,output,submit:text=>{calls.push(`submit:${text}`);return reject ? Promise.reject(Error()) : new Promise(r=>{deliver=r;});}});
  return { session,calls, emit:update=>{inputState={...inputState,...update};listener?.(inputState);}, deliver:()=>deliver('Actual reply'), speak:()=>speechStart(), endSpeech:()=>speechEnd() };
}
test('live session uses actual events; one final utterance, one request, one playback, then listening',async()=>{
  const f=fixture();f.session.start();assert.equal(f.session.getSnapshot().phase,'permission');
  f.emit({status:'listening'});assert.equal(f.session.getSnapshot().phase,'listening');
  f.emit({status:'idle',finalTranscript:'hello'});f.emit({status:'idle',finalTranscript:'hello'});
  assert.equal(f.calls.filter(x=>x==='submit:hello').length,1);assert.equal(f.session.getSnapshot().phase,'working');
  f.deliver();await tick();assert.equal(f.session.getSnapshot().phase,'finalizing');
  f.speak();assert.equal(f.session.getSnapshot().phase,'speaking');f.endSpeech();await tick();
  assert.equal(f.calls.filter(x=>x==='listen').length,2);f.session.dispose();
});
test('end during request ignores late reply and cannot restart while request pending',async()=>{
  const f=fixture();f.session.start();f.emit({status:'idle',finalTranscript:'hello'});f.session.end();f.session.start();
  assert.equal(f.calls.filter(x=>x==='listen').length,1);f.deliver();await tick();assert.equal(f.session.getSnapshot().phase,'closed');assert.ok(!f.calls.includes('Actual reply'));f.session.dispose();
});
test('mute interrupts capture/output; resume is explicit; late callbacks do not submit',()=>{
  const f=fixture();f.session.start();f.session.mute();f.emit({status:'idle',finalTranscript:'late'});assert.ok(!f.calls.some(x=>x.startsWith('submit:')));f.session.resume();assert.equal(f.session.getSnapshot().phase,'permission');f.session.dispose();
});
test('failed request requires explicit recovery; no automatic retry',async()=>{
  const f=fixture({reject:true});f.session.start();f.emit({status:'idle',finalTranscript:'hello'});await tick();assert.equal(f.session.getSnapshot().phase,'error');assert.equal(f.calls.filter(x=>x==='listen').length,1);f.session.dispose();
});
test('unsupported and permission denial never imply listening',()=>{
  const f=fixture({available:false});f.session.start();assert.equal(f.session.getSnapshot().phase,'unsupported');assert.ok(!f.calls.includes('listen'));f.session.dispose();
  const g=fixture();g.session.start();g.emit({status:'error',error:'Permission denied'});assert.equal(g.session.getSnapshot().phase,'error');g.session.dispose();
});
test('empty transcript never submits; disposed session ignores future input',()=>{
  const f=fixture();f.session.start();f.emit({status:'idle',finalTranscript:''});f.session.dispose();f.emit({status:'idle',finalTranscript:'late'});assert.ok(!f.calls.some(x=>x.startsWith('submit:')));
});
test('late output start/end after End cannot speak or reopen microphone',async()=>{
  const f=fixture();f.session.start();f.emit({status:'idle',finalTranscript:'hello'});f.deliver();await tick();f.session.end();f.speak();f.endSpeech();await tick();assert.equal(f.session.getSnapshot().phase,'closed');assert.equal(f.calls.filter(x=>x==='listen').length,1);f.session.dispose();
});
test('late asynchronous capture failure after End stays closed',async()=>{
  let reject;
  const input={getSnapshot:()=>({available:true}),subscribe:()=>()=>{},cancelListening(){},startListening:()=>new Promise((_,r)=>{reject=r;})};
  const session=createOyiLiveVoiceSession({input,output:{available:true,cancel(){},async speak(){}},async submit(){return 'unused';}});
  session.start();session.end();reject(Error('late failure'));await tick();assert.equal(session.getSnapshot().phase,'closed');session.dispose();
});
test('minimal hub reuses Orb; no panel controls, waveform or long normal caption',()=>{
  const state={phase:'listening',caption:'Actual words',requestPending:false};
  const html=render(h(OyiLiveVoiceHub,{state,onEnd(){},onMute(){},onResume(){}}));
  assert.match(html,/oyi-orb/);assert.match(html,/role="status"/);assert.match(html,/Listening…/);assert.doesNotMatch(html,/aria-modal|role="dialog"|role="meter"|<button|Actual words|oyi-live-voice-controls/);
  const shell=render(h(OyiShell,{voiceHub:h(OyiLiveVoiceHub,{state}),composer:'composer fixture'}));assert.ok(shell.indexOf('data-slot="voiceHub"')<shell.indexOf('data-slot="composer"'));
});
test('error detail is disclosed explicitly; never silently hides failure',()=>{
  const html=render(h(OyiLiveVoiceHub,{state:{phase:'error',caption:'Microphone permission was denied.',requestPending:false},onResume(){}}));
  assert.match(html,/Voice interrupted/);assert.match(html,/<details[^>]*><summary>Voice details<\/summary>/);assert.match(html,/Microphone permission was denied/);assert.match(html,/Resume voice/);assert.doesNotMatch(html,/End Live Voice|<details[^>]* open/);
});
test('composer always exposes one active-session End, including typed, working and offline states',()=>{
  for(const value of ['', 'draft'])for(const turnInFlight of [false,true])for(const disabled of [false,true]){
    const html=render(h(OyiComposer,{value,turnInFlight,disabled,onChange(){},onSubmit(){},controlsLayout:'expanded',liveVoiceActive:true,onStartLiveVoice(){},onEndLiveVoice(){}}));
    assert.equal((html.match(/aria-label="End Live Voice"/g)||[]).length,1);assert.match(html,/<button type="button" class="oyi-icon-button" aria-label="End Live Voice">/);assert.doesNotMatch(html,/aria-label="Start Live Voice"/);assert.match(html,/One-shot microphone unavailable while Live Voice is active/);
    if(value)assert.match(html,/Send message|Sending is paused/);
  }
});
test('composer opt-in empty Live Voice vs typed Send; old hosts unchanged',()=>{
  const props={value:'',onChange(){},onSubmit(){},controlsLayout:'expanded'};
  assert.match(render(h(OyiComposer,props)),/aria-label="Send message"/);
  const live=render(h(OyiComposer,{...props,onStartLiveVoice(){}}));assert.match(live,/aria-label="Start Live Voice"/);assert.doesNotMatch(live,/aria-label="Send message"/);
  assert.match(render(h(OyiComposer,{...props,value:'hello',onStartLiveVoice(){}})),/aria-label="Send message"/);
});
