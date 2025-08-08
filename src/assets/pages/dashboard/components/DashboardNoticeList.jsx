import React from "react";
import { Link } from "react-router-dom";
import "./DashboardWidgets.css"; // Reutilizar estilos existentes ou criar um novo

const DashboardNoticeList = ({ avisos }) => {
  if (!avisos || avisos.length === 0) {
    return (
      <div className="dashboard-widget">
        <h3 className="widget-title">Avisos Recentes</h3>
        <p>Nenhum aviso recente.</p>
      </div>
    );
  }

  

  return (
    <div className="dashboard-widget">
      <h3 className="widget-title">Avisos Recentes</h3>
      <ul className="notice-list">
        {avisos.map((aviso) => (
          <li key={aviso.id} className="notice-item">
            <h4>{aviso.titulo}</h4>
            <p>{aviso.descricao}</p>
            {aviso.link && (
              <Link to={aviso.link} className="btn-link">
                Ver Detalhes
              </Link>
            )}
            {aviso.documentos?.editalUrl && (
              <a
                href={getFileUrl(aviso.documentos.editalUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-link"
              >
                Ver Edital
              </a>
            )}
            {aviso.documentos?.conviteUrl && (
              <a
                href={getFileUrl(aviso.documentos.conviteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-link"
              >
                Ver Convite
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardNoticeList;
