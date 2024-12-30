import { Col, Container, Row, Spinner } from "react-bootstrap";

interface LoadingProps {
  message?: string
}

const Loading = (props : LoadingProps) => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row>
        <Col className="text-center">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          {props.message && <p className="mt-2">{props.message}</p>}
        </Col>
      </Row>
    </Container>
  );
}


export default Loading;