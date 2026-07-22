import useResponsive from "../hooks/useResponsive";
import AuthLeftPanel from "./AuthLeftPanel";

export default function AuthLayout({ children }) {
    const { isMobile } = useResponsive()
    const styles = {

        container: {

            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            maxHeight: "100vh",
            overflow: "hidden",

            boxSizing: "border-box",
            position:"relative",
            minHeight: "100vh",

            background:
                "linear-gradient(135deg,#F8F6F2 0%,#F1ECE5 100%)",

        },

        right: {

            flex: 1,

            display: "flex",

            boxSizing: "border-box",

            justifyContent: "center",

            alignItems: "center",

            // padding: "60px",

        },
        footer : {
            position:"absolute",
            bottom:0,
            left:0,
            width:"100%",
        }

    };
    return (

        <div style={styles.container}>

            <AuthLeftPanel />

            <div style={styles.right}>

                {children}

            </div>

            <div style={styles.footer}>
                © 2026 Chat Up
            </div>

        </div>

    );

}

