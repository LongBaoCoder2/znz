import { Toast, ToastContainer } from 'react-bootstrap';

export const MessageModal = ({ type, message, show, onClose }: any) => {
  const styles : any = {
    error: {
      borderLeft: '8px solid lightcoral',
      backgroundColor: '#f8d7da',
      color: '#721c24',
    },
    success: {
      borderLeft: '8px solid lightgreen',
      backgroundColor: '#d4edda',
      color: '#155724',
    },
  };


  return (
    <Toast
      show={show}
      onClose={onClose}
      autohide={true}
      animation={true}
      style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        minWidth: '18vw',
        padding: '5px',
        ...styles[type],
      }}
    >
      <Toast.Body
        style={{
          fontSize: '1em',         // Change font size here
          display: 'flex',          // Use flexbox for centering
          alignItems: 'center',     // Vertically center the text
          // justifyContent: 'center', // Optionally, horizontally center the text
          // fontWeight: 'bold',
        }}
      >
        {message}
      </Toast.Body>
    </Toast>
  );
};


const MessageModalContainer = ({type, message, isVisible, hideMessage}: any) => {
  return (
    <ToastContainer position="top-start" className="p-3">
        <MessageModal
          type={type}
          message={message}
          show={isVisible}
          onClose={hideMessage}
        />
      </ToastContainer>
  );
};

export default MessageModalContainer;