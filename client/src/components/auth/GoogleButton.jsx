import { GoogleLogin } from "@react-oauth/google";

export default function GoogleButton({
    onSuccess,
}){

    return(

        <div
            style={{
                display:"flex",
                justifyContent:"center",
                transform: "scale(1.2)", transformOrigin: "center",
            }}
        >

            <GoogleLogin
                
                onSuccess={onSuccess}

                shape="pill"

                size= "medium"

                width="250px"  

                onError={()=>{
                    console.log("Google Login Failed");
                }}

            />

        </div>

    );

}