export default function Divider() {

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

const styles={

row:{

display:"flex",

alignItems:"center",

margin:"10px 0",

},

line:{

flex:1,

height:1,

background:"#E5E5E5",

},

text:{

padding:"0 14px",

color:"#999",

fontSize:13,

fontWeight:600,

}

}