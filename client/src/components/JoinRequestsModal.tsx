import { Button, Modal } from "react-bootstrap";
import { JoinRequest } from "../interface/Participant";

const JoinRequestsModal = ({
  show,
  onHide,
  requests,
  onResponse
}: {
  show: boolean;
  onHide: () => void;
  requests: JoinRequest[];
  onResponse: (socketId: string, approved: boolean) => void;
}) => (
  <Modal show={show} onHide={onHide} centered size='lg'>
    <Modal.Header closeButton>
      <Modal.Title>Pending Join Requests</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className='list-group'>
        {requests.length === 0 ? (
          <p className='text-center'>No pending requests</p>
        ) : (
          requests.map((request) => (
            <div key={request.socketId} className='list-group-item d-flex justify-content-between align-items-center'>
              <div>
                <h6 className='mb-1'>{request.username}</h6>
                <small className='text-muted'>Requested at {new Date(request.timestamp).toLocaleTimeString()}</small>
              </div>
              <div className='btn-group'>
                <Button variant='danger' size='sm' onClick={() => onResponse(request.socketId, false)}>
                  Reject
                </Button>
                <Button variant='success' size='sm' onClick={() => onResponse(request.socketId, true)}>
                  Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant='secondary' onClick={onHide}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

export default JoinRequestsModal;
