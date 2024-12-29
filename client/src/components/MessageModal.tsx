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
        minWidth: '250px',
        ...styles[type],
      }}
    >
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
};


const MessageModalContainer = ({type, message, showMessageModel, setShowMessageModel}: any) => {
  return (
    <ToastContainer position="top-start" className="p-3">
        <MessageModal
          type={type}
          message={message}
          show={showMessageModel}
          onClose={() => setShowMessageModel(false)}
        />
      </ToastContainer>
  );
};

export default MessageModalContainer;