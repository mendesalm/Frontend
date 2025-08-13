import React, { useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./HomePage.css"; // Importando o novo CSS

// Importe os componentes utilizados na HomePage
import GridSection from "../../../components/grid/GridSection.jsx";
import LocationSection from "../../../components/location/LocationSection.jsx";

// Importe as imagens
import imgSlider2 from "../../images/slider/slider2.jpg"; // Apenas a imagem necessária

// ATUALIZADO: Importação das novas imagens para os cards
import missaoIcon from "../../images/esq.png";
import visaoIcon from "../../images/esq.png";
import valoresIcon from "../../images/esq.png";
import ritoIcon from "../../images/RitoBrasileiro.png";

import Footer from "../../../components/footer/Footer.jsx";

const HomePage = () => {
  const location = useLocation();

  const cardData = useMemo(
    () => [
      {
        title: "Nossa Missão",
        text: "Promover o aperfeiçoamento moral e intelectual de nossos membros, desbastando a pedra bruta para transformar homens bons em líderes exemplares para suas famílias e para a sociedade. Através do estudo contínuo, do debate fraterno e da prática dos valores maçónicos, atuamos como uma força positiva e catalisadora para o progresso da comunidade de Anápolis, honrando o legado de nossa Loja e construindo um futuro mais justo e esclarecido.",
        image: missaoIcon,
      },
      {
        title: "Nossa Visão",
        text: "Ser reconhecida em Anápolis e em todo o estado de Goiás como uma Oficina de excelência, um farol de sabedoria, ética e fraternidade. Almejamos ser um centro de formação de cidadãos conscientes e atuantes, cujas contribuições e ações filantrópicas deixem uma marca indelével e positiva, inspirando e iluminando o caminho para as futuras gerações na construção de uma sociedade mais justa, livre e igualitária.",
        image: visaoIcon,
      },
      {
        title: "Nossos Valores",
        content: (
          <ul
            style={{
              textAlign: "left",
              paddingLeft: "20px",
              listStylePosition: "inside",
            }}
          >
            <li>
              <strong>Fraternidade:</strong> Cultivar laços de união, lealdade e
              apoio mútuo entre os Irmãos.
            </li>
            <li>
              <strong>Conhecimento:</strong> Buscar incessantemente a verdade, a
              sabedoria e o desenvolvimento intelectual.
            </li>
            <li>
              <strong>Retidão:</strong> Agir com integridade, honra e justiça em
              todas as nossas ações.
            </li>
            <li>
              <strong>Filantropia:</strong> Praticar a caridade e o serviço
              desinteressado, visando o bem-estar da comunidade.
            </li>
            <li>
              <strong>Tolerância:</strong> Respeitar a diversidade de opiniões,
              crenças e origens, promovendo a paz e a harmonia.
            </li>
          </ul>
        ),
        image: valoresIcon,
      },
      {
        title: "Aprimoramento Contínuo",
        text: 'Nossa Loja pratica o Rito Brasileiro e oferece uma jornada completa de desenvolvimento maçônico. Para os Mestres que aspiram aprofundar seus conhecimentos, o caminho se estende através dos Graus Filosóficos. A loja sedia o Sublime Capítulo "José de Lima Júnior" e o Conselho Kadoshi "Pedro Moreira de Lima" conferidos pelo Supremo Conclave do Brasil para o Rito Brasileiro de Maçons Antigos, Livres e Aceitos. Esta via de aperfeiçoamento permite que os filiados alcancem o ápice do Rito, o Grau 33, consolidando uma formação filosófica e humanística de excelência. A Loja sedia os 30 primeiros graus dessa jornada!',
        image: ritoIcon,
      },
    ],
    []
  );

  // Efeito para lidar com a rolagem suave para âncoras (#)
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.substring(1);
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div className="scroll-container">
      <section
        id="inicio"
        className="hero-section"
        style={{ backgroundImage: `url(${imgSlider2})` }}
        aria-label="Início"
      >
        <div className="hero-text">
          <h1>
            Loja João Pedro Junqueira
            <br />A 43 anos tornando melhores os Homens de Bem!
          </h1>
        </div>
      </section>
      <section id="sobre-nos" aria-label="Sobre Nós">
        <GridSection cardTexts={cardData} />
      </section>
      <section id="localizacao" aria-label="Nossa Localização">
        <LocationSection />
      </section>
      <section
        id="contato"
        aria-label="Entre em Contato"
        style={{ padding: "50px 0", minHeight: "300px", textAlign: "center" }}
      >
        <div>
          <h2>Entre em Contato</h2>
          <p>Email: contato@exemplo.com | Telefone: (XX) XXXX-XXXX</p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
