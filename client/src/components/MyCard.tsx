// // import { useEffect, useRef } from "react";
// import { PersonFill, MicFill, MicMuteFill } from "react-bootstrap-icons";
// import { Card } from "react-bootstrap";
// import { useEffect } from "react";

// interface MyCardProps {
//   videoRef: React.RefObject<HTMLVideoElement>;
//   username: string;
//   micOn: boolean;
//   cameraOn: boolean;
// }

// const MyCard = ({ videoRef, username, micOn, cameraOn }: MyCardProps) => {
//   useEffect(() => {
//     if (videoRef.current && cameraOn && publish?.localStream) {
//       videoRef.current.srcObject = publish.localStream;
//     }
//   }, [videoRef, cameraOn]);

//   return (
//     <Card className="position-relative h-100" style={{
//       backgroundColor: "#1E2757",
//       border: "none",
//       maxHeight: "calc(90vh - 2rem)"
//     }}>
//       {cameraOn ? (
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "cover",
//             borderRadius: "0.5rem"
//           }}
//           muted
//         />
//       ) : (
//         <div className="d-flex justify-content-center align-items-center h-100">
//           <PersonFill size={72} color="#6c757d"/>
//         </div>
//       )}

//       <div className="position-absolute bottom-0 w-100 d-flex justify-content-between p-2"
//            style={{
//              background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
//              borderBottomLeftRadius: "0.5rem",
//              borderBottomRightRadius: "0.5rem"
//            }}>
//         <span className="text-white">{username} (You)</span>
//         {micOn ?
//           <MicFill color="white" size={16} /> :
//           <MicMuteFill color="red" size={16} />
//         }
//       </div>
//     </Card>
//   );
// };

// export default MyCard;
