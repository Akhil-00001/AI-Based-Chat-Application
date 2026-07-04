import AuthLeftPanel from "./AuthLeftPanel";

export default function AuthLayout({ children }) {

    return (

        <div style={styles.container}>

            <AuthLeftPanel />

            <div style={styles.right}>

                {children}

            </div>

        </div>

    );

}

const styles = {

    container: {

        display: "flex",

        maxHeight : "100vh",
        overflow : "hidden",

        boxSizing:"border-box",

        minHeight: "100vh",

        background:
            "linear-gradient(135deg,#F8F6F2 0%,#F1ECE5 100%)",

    },

    right: {

        flex: 1,

        display: "flex",
        
        boxSizing:"border-box",

        justifyContent: "center",

        alignItems: "center",

        // padding: "60px",

    },

};