import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Loja Maçônica João Pedro Junqueira nº 2181. Todos os direitos reservados.</p>
        <p>Desenvolvido por André Luiz Mendes</p>
      </div>
    </footer>
  );
};

export default Footer;
