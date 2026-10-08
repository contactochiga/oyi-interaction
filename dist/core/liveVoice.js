export function createOyiLiveVoiceSession(options) {
    let snapshot = { phase: "closed", caption: "", requestPending: false };
    let epoch = 0;
    const listeners = new Set();
    const emit = (update) => { snapshot = { ...snapshot, ...update }; listeners.forEach(fn => fn(snapshot)); };
    const halt = () => { epoch++; options.input.cancelListening(); options.output.cancel(); };
    const fail = (caption) => { emit({ phase: "error", caption }); halt(); };
    function listen() {
        if (snapshot.requestPending)
            return;
        if (!options.input.getSnapshot().available || !options.output.available) {
            emit({ phase: "unsupported", caption: "Live Voice needs browser speech recognition and speech output. Native live voice is not available here; you can still type." });
            return;
        }
        emit({ phase: "permission", caption: "Allow microphone access to start browser Live Voice." });
        try {
            void Promise.resolve(options.input.startListening()).catch(() => fail("Microphone capture could not start. Retry or type your message."));
        }
        catch {
            fail("Microphone capture could not start. Retry or type your message.");
        }
    }
    async function turn(text) {
        if (snapshot.requestPending)
            return;
        const token = epoch;
        emit({ phase: "working", caption: "Working on your request…", requestPending: true });
        try {
            const response = await options.submit(text);
            if (token !== epoch)
                return;
            if (!response.trim())
                throw new Error("No response");
            // Not 'speaking' until the real output transport confirms audio start.
            emit({ phase: "finalizing", caption: "Starting speech playback…" });
            await options.output.speak(response, () => { if (token === epoch)
                emit({ phase: "speaking", caption: response }); });
            if (token !== epoch)
                return;
            emit({ requestPending: false });
            listen();
        }
        catch {
            if (token === epoch)
                fail("Live Voice could not complete this turn. Check the chat before retrying; nothing will be resent automatically.");
        }
        finally {
            emit({ requestPending: false });
        }
    }
    const unsubscribe = options.input.subscribe(next => {
        if (!["permission", "listening", "finalizing"].includes(snapshot.phase) || snapshot.requestPending)
            return;
        if (next.status === "error") {
            fail(next.error || "Speech recognition failed. Retry or type.");
            return;
        }
        if (next.status === "listening")
            emit({ phase: "listening", caption: next.interimTranscript || next.finalTranscript || "I’m listening…" });
        else if (next.status === "transcribing")
            emit({ phase: "finalizing", caption: "Finalizing transcription…" });
        else if (next.status === "idle" && next.finalTranscript.trim())
            void turn(next.finalTranscript.trim());
    });
    return {
        getSnapshot: () => snapshot,
        subscribe(fn) { listeners.add(fn); return () => { listeners.delete(fn); }; },
        start() { if (snapshot.phase === "closed")
            listen(); },
        mute(reason = "Microphone muted. Resume when you’re ready.") { if (snapshot.phase === "closed")
            return; emit({ phase: "muted", caption: reason }); halt(); },
        resume() { if (["muted", "error"].includes(snapshot.phase) && !snapshot.requestPending)
            listen(); },
        end() { emit({ phase: "closed", caption: "" }); halt(); },
        dispose() { emit({ phase: "closed", caption: "" }); unsubscribe(); halt(); listeners.clear(); },
    };
}
