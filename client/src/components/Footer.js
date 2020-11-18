import React from 'react';

import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className='footer-container text-white'>
      <Container>
        <Row>
          <Col className="text-center py-3">Copyright &copy; Bharuch Store</Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
