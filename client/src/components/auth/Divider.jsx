
import useResponsive from "../hooks/useResponsive";

export default function Divider() {
    const { isMobile } = useResponsive();
    const styles = {

        row: {

            display: "flex",

            alignItems: "center",

            margin: isMobile ? "5px 0" : "10px 0",

        },

        line: {

            flex: 1,

            height: 1,

            background: "#E5E5E5",

        },

        text: {

            padding: "0 14px",

            color: "#999",

            fontSize: 13,

            fontWeight: 600,

        }

    }
    return (

        <div style={styles.row}>

            <div style={styles.line} />

            <span style={styles.text}>
                OR
            </span>

            <div style={styles.line} />

        </div>

    );

}

