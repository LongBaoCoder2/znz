import { Toast, ToastContainer } from 'react-bootstrap';

export const MessageModal = ({ title, type, message, show, onClose }: any) => {
  const styles: any = {
    error: {
      borderLeft: '8px solid #f44336',  // Bright red for error
      backgroundColor: '#ffebee',  // Lighter red background
      color: '#d32f2f',  // Darker red text
    },
    success: {
      borderLeft: '8px solid #4caf50',  // Green for success
      backgroundColor: '#e8f5e9',  // Light green background
      color: '#388e3c',  // Darker green text
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
        minWidth: '18vw',  // Slightly larger width for better content fitting
        borderRadius: '12px',  // Rounded corners
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',  // Stronger shadow for depth
        transition: 'all 0.3s ease',  // Smoother transition effects
        zIndex: 9999,  // Ensure it's always on top
        ...styles[type],
      }}
    >
      <div
        style={{
          fontSize: '1em',
          fontWeight: 'bold',
          padding: '5px',
          paddingLeft: '15px',
          color: 'inherit',
          marginBottom: "-8px"
        }}
      >
        {title}
      </div>

      <Toast.Body
        style={{
          fontSize: '1.2em',
          fontWeight: 'normal',
          padding: '5px',
          paddingLeft: '15px',
          color: 'inherit',
        }}
      >
        {message}
      </Toast.Body>
    </Toast>
  );
};

const MessageModalContainer = ({title, type, message, isVisible, hideMessage}: any) => {
  return (
    <ToastContainer position="top-start" className="p-3">
      <MessageModal
        title={title}
        type={type}
        message={message}
        show={isVisible}
        onClose={hideMessage}
      />
    </ToastContainer>
  );
};

export default MessageModalContainer;
