import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const location = useLocation();

  const handleLinkClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.topContent}>
        <div className={styles.information}>
          <h3>Fale Conosco</h3>
          <p><FaMapMarkerAlt /> Rua Vicente Bezerra da Costa, 338 - São Sebastião, Iguatu-CE</p>
          <p><FaPhone /> (88) 3581-0011</p>
          <p><FaWhatsapp /> (88) 98872-4728</p>
          <p><FaEnvelope /> admhmaa@gmail.com</p>
        </div>

        <div className={styles.navigation}>
          <h3>Navegação</h3>
          <div className={styles.navGrid}>
            <ul>
              <li><Link to="/" onClick={(e) => handleLinkClick(e, "/")}>Home</Link></li>
              <li><Link to="/sobre" onClick={(e) => handleLinkClick(e, "/sobre")}>Sobre</Link></li>
              <li><Link to="/especialidades" onClick={(e) => handleLinkClick(e, "/especialidades")}>Especialidades</Link></li>
              <li><Link to="/cartao" onClick={(e) => handleLinkClick(e, "/cartao")}>Clínica</Link></li>
                
               <li><Link to="/filantropia" onClick={(e) => handleLinkClick(e, "/filantropia")}>Filantropia</Link></li>        
            </ul>
            <ul>            
              <li><Link to="/igualdade-salarial" onClick={(e) => handleLinkClick(e, "/igualdade-salarial")}>Igualdade Salarial</Link></li>
             {/* <li><Link to="/corpo-clinico" onClick={(e) => handleLinkClick(e, "/corpo-clinico")}>Corpo Clínico</Link></li>*/}
              <li><Link to="/duvidas" onClick={(e) => handleLinkClick(e, "/duvidas")}>Dúvidas Frequentes</Link></li>
               <li><Link to="/noticias" onClick={(e) => handleLinkClick(e, "/noticias")}>Notícias</Link></li>
              <li><Link to="/trabalhe-conosco" onClick={(e) => handleLinkClick(e, "/trabalhe-conosco")}>Trabalhe Conosco</Link></li>
              <li><Link to="/portal-da-transparencia" onClick={(e) => handleLinkClick(e, "/portal-da-transparencia")}>Portal da Transparência</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.icons}>
          <h3>Siga-nos</h3>
          <ul>
            <li>
              <a href="https://www.facebook.com/HospitalAgenorAraujo" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/hosp_agenoraraujo/" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/hospital-agenor-araujo/" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.logosSection}>
        <div className={styles.logosContainer}>
          <div className={styles.logoItem}>
            <img src="LOGO HMAA1.png" alt="hmaa" />
          </div>

          <div className={styles.logoItem}>
            <img src="LOGO HMAA2.png" alt="Casado Saúde" />
          </div>
        </div>

        <p className={styles.footerBottom}>
          &copy; {new Date().getFullYear()} Hospital e Maternidade Dr. Agenor Araújo — 
          Desenvolvido por Saulo Silva — Todos os direitos reservados.
        </p>
      </div>    
    </footer>
  );
};

export default Footer;