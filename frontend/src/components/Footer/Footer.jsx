import React from 'react'
import './footer.css'
import { Container, Row, Col, ListGroup, ListGroupItem } from 'reactstrap'
import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo-no-background.png'
// import logo from '../../assets/images/logo.png'

const quick__links = [
   {
      path: '/home',
      display: 'Home'
   },
   {
      path: '/about',
      display: 'About'
   },
   {
      path: '/tours',
      display: 'Tours'
   },
]

const quick__links2 = [
   {
      path: '/gallery',
      display: 'Gallery'
   },
   {
      path: '/login',
      display: 'Login'
   },
   {
      path: '/register',
      display: 'Register'
   },
]

const Footer = () => {
   const year = new Date().getFullYear()

   return (
      <footer className='footer'>
         <Container>
            <Row>
               <Col lg='3'>
                  <div className="logo">
                     <img src={logo} alt="" />
                     <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, enim.</p>
                     <div className="social__link d-flex align-items-center gap-4">
                        <span>
                        <a href='https://twitter.com/RoshanPrusty6' target='_blank' rel='noreferrer'>
                              <i className='ri-twitter-fill'></i>
                           </a>
                        </span>
                        <span>
                           <a href='https://github.com/roshanprusty' target='_blank' rel='noreferrer'>
                              <i className='ri-github-fill'></i>
                           </a>
                        </span>
                        <span>
                        <a href='https://www.linkedin.com/in/roshan-prusty/' target='_blank' rel='noreferrer'>
                              <i className='ri-linkedin-fill'></i>
                           </a>
                        </span>
                        <span>
                        <a href='https://www.instagram.com/roshan._.prusty/' target='_blank' rel='noreferrer'>
                              <i className='ri-instagram-line'></i>
                           </a>
                        </span>
                     </div>
                  </div>
               </Col>

               <Col lg='3'>
                  <h5 className="footer__link-title">Discover</h5>

                  <ListGroup className='footer__quick-links'>
                     {
                        quick__links.map((item, index) => (
                           <ListGroupItem key={index} className='ps-0 border-0'>
                              <Link to={item.path}>{item.display}</Link>
                           </ListGroupItem>
                        ))
                     }
                  </ListGroup>
               </Col>
               <Col lg='3'>
                  <h5 className="footer__link-title">Quick Links</h5>

                  <ListGroup className='footer__quick-links'>
                     {
                        quick__links2.map((item, index) => (
                           <ListGroupItem key={index} className='ps-0 border-0'>
                              <Link to={item.path}>{item.display}</Link>
                           </ListGroupItem>
                        ))
                     }
                  </ListGroup>
               </Col>
               <Col lg='3'>
                  <h5 className="footer__link-title">Contact</h5>

                  <ListGroup className='footer__quick-links'>
                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                           <span><i class='ri-map-pin-line'></i></span>
                           Address:
                        </h6>
                        <p className='mb-0'>LPU</p>
                     </ListGroupItem>

                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                           <span><i class='ri-mail-line'></i></span>
                           Email:
                        </h6>

                        <p className='mb-0'>roshan18@gmail.com</p>
                     </ListGroupItem>

                     <ListGroupItem className='ps-0 border-0 d-flex align-items-center gap-3'>
                        <h6 className='mb-0 d-flex align-items-center gap-2'>
                           <span><i class='ri-phone-fill'></i></span>
                           Phone:
                        </h6>

                        <p className='mb-0'>7894561230</p>
                     </ListGroupItem>
                  </ListGroup>
               </Col>
            </Row>
         </Container>
      </footer>
   )
}

export default Footer