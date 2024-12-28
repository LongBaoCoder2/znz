import { Modal } from "react-bootstrap";

const WaitingApprovalModal = ({ show }: { show: boolean }) => (
  <Modal show={show} backdrop='static' keyboard={false} centered>
    <Modal.Body className='text-center'>
      <div className='spinner-border m-3' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
      <p>Waiting for host approval...</p>
    </Modal.Body>
  </Modal>
);

export default WaitingApprovalModal;
