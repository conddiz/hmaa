import React, { useState, useRef, useEffect } from "react";
import styles from "./HeaderInfo.module.css";
import {FaFacebookF, FaInstagram, FaHeadset, FaEnvelope, FaBriefcase} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

function HeaderInfo() { 

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClose = () => {
    setDropdownOpen(false);
  };

  useEffect(() => {

    function handleClickOutside(event) {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }

    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, []);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location]);

  return (

    <div className={styles.headerInfo}>

      <div
        className={styles.ouvidoria}
        ref={dropdownRef}
      >

        <FaEnvelope className={styles.ouvidoriaIcon} />

        <button
          type="button"
          className={`${styles.menuTitulo} ${
            dropdownOpen ? styles.active : ""
          }`}
          onClick={toggleDropdown}
        >
          Fale Conosco
        </button>

        <div
          className={`${styles.submenu} ${
            dropdownOpen ? styles.show : ""
          }`}
        >

          <Link
            to="/ouvidoria"
            className={styles.submenuLink}
            onClick={handleClose}
          >
            Ouvidoria
          </Link>

          <Link
            to="/fale-conosco/canal-de-integridade"
            className={styles.submenuLink}
            onClick={handleClose}
          >
            Canal de Integridade
          </Link>

        </div>

      </div>

      <Link
        to="/trabalhe-conosco"
        className={styles.trabalheConosco}
      >
        <FaBriefcase className={styles.trabalheConoscoIcon} />

        <span>
          Trabalhe Conosco
        </span>

      </Link>

      <div className={styles.socialMedia}>

        <span className={styles.socialText}>
          Siga nossas redes sociais:
        </span>

        <a
          href="https://www.facebook.com/HospitalAgenorAraujo"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <FaFacebookF className={styles.icon} />
        </a>

        <a
          href="https://www.instagram.com/hosp_agenoraraujo"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram className={styles.icon} />
        </a>

      </div>

    </div>

  );
}

export default HeaderInfo;