
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import styles from './Header.module.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [transparenciaOpen, setTransparenciaOpen] = useState(false);
  const [mobileTransparenciaOpen, setMobileTransparenciaOpen] = useState(false);

  const dropdownRef = useRef(null);
  const transparenciaRef = useRef(null);
  const location = useLocation();
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const toggleTransparencia = () => {
    setTransparenciaOpen((prev) => !prev);
  };

  const toggleMobileTransparencia = () => {
    setMobileTransparenciaOpen((prev) => !prev);
  };

  const handleCloseAll = () => {
    setDropdownOpen(false);
    setTransparenciaOpen(false);
    setMobileTransparenciaOpen(false);
    setMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }

      if (
        transparenciaRef.current &&
        !transparenciaRef.current.contains(event.target)
      ) {
        setTransparenciaOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setTransparenciaOpen(false);
    setMobileTransparenciaOpen(false);
    setMenuOpen(false);
  }, [location]);

  return (
    <header className={styles.header}>
      <Link to="/" onClick={handleCloseAll}>
        <img
          src="logo.jpg"
          alt="Logo HMAA"
          className={styles.logo}
        />
      </Link>

      <nav className={styles.desktopMenu}>
        <Link to="/" onClick={handleCloseAll}> HOME </Link>
            
        <div className={styles.dropdown} ref={dropdownRef}>
          <span
            className={`${styles.dropdownTitle} ${
              dropdownOpen ? styles.active : ''
            }`}
            onClick={toggleDropdown}
            role="button"
            tabIndex={0}
            aria-expanded={dropdownOpen}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleDropdown();
              }
            }}
          >
            SAIBA MAIS
          </span>

          <div
            className={`${styles.dropdownContent} ${
              dropdownOpen ? styles.show : ''
            }`}
          >
            <Link to="/sobre" onClick={handleCloseAll}> SOBRE NÓS </Link>                
            <Link to="/especialidades" onClick={handleCloseAll}> ESPECIALIDADES </Link>                    
            <Link to="/filantropia" onClick={handleCloseAll}> FILANTROPIA </Link>                   
            <Link to="/duvidas" onClick={handleCloseAll}> DÚVIDAS FREQUENTES </Link>        
          </div>
        </div>

        <Link to="/cartao" onClick={handleCloseAll}> CLÍNICA </Link>               
        <Link to="/noticias" onClick={handleCloseAll}> NOTÍCIAS </Link>
            
        <div
          className={`${styles.dropdown} ${styles.transparenciaDropdown}`}
          ref={transparenciaRef}
        >
          <span
            className={`${styles.dropdownTitle} ${
              transparenciaOpen ? styles.active : ''
            }`}
            onClick={toggleTransparencia}
            role="button"
            tabIndex={0}
            aria-expanded={transparenciaOpen}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleTransparencia();
              }
            }}
          >
            PORTAL DA TRANSPARÊNCIA
          </span>

          <div
            className={`${styles.dropdownContent} ${
              styles.transparenciaDropdownContent
            } ${transparenciaOpen ? styles.show : ''}`}
          >
            <Link to="/portal-da-transparencia" onClick={handleCloseAll} > EMENDAS PARLAMENTARES </Link>                
            <Link to="/igualdade-salarial" onClick={handleCloseAll} > TRANSPARÊNCIA SALARIAL </Link>                                              
            <Link to="/codigo-de-etica" onClick={handleCloseAll} > CÓDIGO DE ÉTICA </Link>                                     
          </div>
        </div>
      </nav>

      <button
        type="button"
        className={styles.menuIcon}
        onClick={toggleMenu}
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={menuOpen}
      >
        <FaBars />
      </button>

      <div
        className={`${styles.mobileDrawer} ${
          menuOpen ? styles.open : ''
        }`}
      >
        <div className={styles.drawerHeader}>
          <FaTimes
            className={styles.closeIcon}
            onClick={handleCloseAll}
            role="button"
            tabIndex={0}
            aria-label="Fechar menu"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleCloseAll();
              }
            }}
          />
        </div>

        <nav className={styles.drawerMenu}>
          <Link to="/" onClick={handleCloseAll}> HOME  </Link>    

          <div className={styles.mobileDropdown}>
            <span
              onClick={toggleDropdown}
              role="button"
              tabIndex={0}
              aria-expanded={dropdownOpen}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleDropdown();
                }
              }}
            >
              SAIBA MAIS
            </span>

            <div
              className={`${styles.dropdownContentMobile} ${
                dropdownOpen ? styles.showMobile : ''
              }`}
            >
              <Link to="/sobre" onClick={handleCloseAll}> SOBRE NÓS </Link>
              <Link to="/especialidades" onClick={handleCloseAll}> ESPECIALIDADES </Link>         
              <Link to="/filantropia" onClick={handleCloseAll}> FILANTROPIA </Link>             
              <Link to="/duvidas" onClick={handleCloseAll}>   DÚVIDAS FREQUENTES  </Link>
            </div>
          </div>

          <Link to="/cartao" onClick={handleCloseAll}> CLÍNICA </Link>               
          <Link to="/noticias" onClick={handleCloseAll}> NOTÍCIAS </Link>                

          <div className={styles.mobileDropdown}>
            <span
              onClick={toggleMobileTransparencia}
              role="button"
              tabIndex={0}
              aria-expanded={mobileTransparenciaOpen}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleMobileTransparencia();
                }
              }}
            >
              PORTAL DA TRANSPARÊNCIA
            </span>          
            <div
              className={`${styles.dropdownContentMobile} ${
                mobileTransparenciaOpen ? styles.showMobile : ''
              }`}
            >
              <Link to="/portal-da-transparencia" onClick={handleCloseAll} > EMENDAS PARLAMENTARES </Link>                                                          
              <Link to="/igualdade-salarial" onClick={handleCloseAll} >  TRANSPARÊNCIA SALARIAL </Link>                                             
              <Link to="/codigo-de-etica" onClick={handleCloseAll} > CÓDIGO DE ÉTICA </Link>
                                                                   
            </div>
          </div>
        </nav>
      </div>

      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={handleCloseAll}
        />
      )}
    </header>
  );
}

export default Header;