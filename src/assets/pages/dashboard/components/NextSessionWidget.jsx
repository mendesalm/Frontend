
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './NextSessionWidget.css';
import { getFileUrl } from '../../../../utils/fileUtils';



const NextSessionWidget = ({ session }) => {
  if (!session) {
    return (
      <div className="next-session-widget">
        <h3>Próxima Sessão</h3>
        <p>Nenhuma sessão agendada.</p>
      </div>
    );
  }

  const { dataSessao, tipoSessao, subtipoSessao, edital, convite } = session;

  const formattedDate = format(new Date(dataSessao), "EEEE, dd 'de' MMMM 'de' yyyy, 'às' HH:mm'h'", { locale: ptBR });

  return (
    <div className="next-session-widget">
      <h3>Próxima Sessão</h3>
      <p className="session-date">{formattedDate}</p>
      <p className="session-type">{tipoSessao} - {subtipoSessao}</p>
      <div className="session-links">
        {edital && edital.caminhoPdfLocal && (
          <a href={getFileUrl(edital.caminhoPdfLocal)} target="_blank" rel="noopener noreferrer" className="btn-document">
            Ver Edital
          </a>
        )}
        {convite && convite.caminhoPdfLocal && (
          <a href={getFileUrl(convite.caminhoPdfLocal)} target="_blank" rel="noopener noreferrer" className="btn-document">
            Ver Convite
          </a>
        )}
        <Link to={`/sessoes/${session.id}`} className="btn-details">
          Mais Detalhes
        </Link>
      </div>
    </div>
  );
};

export default NextSessionWidget;
