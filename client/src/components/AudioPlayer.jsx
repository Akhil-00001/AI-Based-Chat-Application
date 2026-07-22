import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import playIcon from "../assets/play.png"
import pauseIcon from "../assets/pause.png"
import useResponsive from "./hooks/useResponsive";
export default function AudioPlayer({ src }) {

    const audioRef = useRef(null);
    const { theme } = useTheme();
    const sliderRef = useRef(null);
    const {isMobile} = useResponsive();
    const [playing, setPlaying] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [duration, setDuration] = useState(0);

    const [currentTime, setCurrentTime] = useState(0);

    const formatTime = (sec) => {
        if (!sec) return "0:00";

        const m = Math.floor(sec / 60);

        const s = Math.floor(sec % 60);

        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const togglePlay = () => {

        if (!audioRef.current) return;

        if (playing) {

            audioRef.current.pause();

        } else {

            audioRef.current.play();

        }

        setPlaying(!playing);
    };

    useEffect(() => {

        const audio = audioRef.current;

        if (!audio) return;

        const loaded = () =>
            setDuration(audio.duration);

        const update = () =>
            setCurrentTime(audio.currentTime);

        const ended = () =>
            setPlaying(false);

        audio.addEventListener(
            "loadedmetadata",
            loaded
        );

        audio.addEventListener(
            "timeupdate",
            update
        );

        audio.addEventListener(
            "ended",
            ended
        );

        return () => {

            audio.removeEventListener(
                "loadedmetadata",
                loaded
            );

            audio.removeEventListener(
                "timeupdate",
                update
            );

            audio.removeEventListener(
                "ended",
                ended
            );

        };

    }, []);

    const progress =
        duration
            ? (currentTime / duration) * 100
            : 0;

    const handleSeek = (e) => {

        if (!sliderRef.current) return;

        const rect =
            sliderRef.current.getBoundingClientRect();

        const x = e.clientX - rect.left;

        const percent =
            Math.min(
                Math.max(x / rect.width, 0),
                1
            );

        const time =
            percent * duration;

        audioRef.current.currentTime = time;

        setCurrentTime(time);
    };

    useEffect(() => {
        if (!dragging) return;

        const move = (e) => {
            if (!sliderRef.current) return;

            const rect = sliderRef.current.getBoundingClientRect();

            let percent =
                (e.clientX - rect.left) / rect.width;

            percent = Math.max(0, Math.min(1, percent));

            const time = percent * duration;

            audioRef.current.currentTime = time;
            setCurrentTime(time);
        };

        const up = () => {
            setDragging(false);
        };

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);

        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        };

    }, [dragging, duration]);

    const styles = {

        track: {

            flex: 1,

            height: 3,

            background: "#d1d5db",

            borderRadius: 999,

            position: "relative",

            cursor: "pointer",

            width : isMobile ? "100px" : "200px" ,
        },

        progress: {

            position: "absolute",

            left: 0,

            top: 0,

            bottom: 0,

            background: theme.accent,

            borderRadius: 999,

        },

        thumb: {
            position: "absolute",
            top: "50%",

            width: 8,
            height: 8,

            borderRadius: "50%",

            background: theme.accent,

            transform: "translate(-50%,-50%)",

            transition:
                "transform .15s ease, box-shadow .15s ease",

            cursor: dragging ? "grabbing" : "grab",

            // boxShadow:
            //     "0 0 10px rgba(124,58,237,.35)",
        },

        player: {

            display: "flex",

            alignItems: "center",

            gap: 12,

            padding: "6px 10px",

            borderRadius: 16,

            background: theme.panelBg,

            width: "100%",

        },

        play: {
            display: "flex",
            alignItems: "center",
            width: 34,

            height: 34,

            borderRadius: "40%",

            border: "none",

            // background: theme.accent,

            color: theme.sendButtonText,

            cursor: "pointer",

            fontSize: 16,

        },

        slider: {

            flex: 1,

            accentColor: theme.inputBg,



            cursor: "pointer",

        },

        time: {

            fontSize: isMobile ? 10 : 13,

            minWidth: isMobile ? 40 : 70,

            color: theme.timestampText,

        }

    };

    return (

        <div style={styles.player}>

            <audio
                ref={audioRef}
                src={src}

            />

            <button
                style={{ ...styles.play, justifyContent: "center" }}
                onClick={togglePlay}
            >
                {playing ? <img src={pauseIcon} style={{ width: isMobile ? 15 : 20, alignSelf: "center" }} alt="" /> : <img src={playIcon} style={{ width: isMobile ? 15 : "20px" }} alt="" />}
            </button>
            <div style={{ display: "flex", flexDirection: "column" , gap:"5px"}}>
                <div
                    ref={sliderRef}
                    onClick={handleSeek}
                    style={styles.track}
                >
                    <div
                        style={{
                            ...styles.progress,
                            width: `${progress}%`,
                        }}
                    />

                    <div
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow =
                                "0 0 16px rgba(124,58,237,.6)";
                        }}

                        onMouseLeave={(e) => {
                            if (dragging) return;

                            e.currentTarget.style.boxShadow =
                                "0 0 10px rgba(124,58,237,.35)";
                        }}
                        onMouseDown={() => setDragging(true)}
                        style={{
                            ...styles.thumb,
                            left: `${progress}%`,
                            transform: `translate(-50%,-50%) scale(${dragging ? 1.35 : 1})`,
                        }}
                    />
                </div>

                <span style={styles.time}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>
            </div>



        </div>

    );

}