import {BrowserRouter, Route, Routes} from "react-router-dom"
import Home from "./pages/Home"
import Especialidades from "./pages/Especialidades"
import Sobre from "./pages/Sobre"
import Projeto from "./pages/Projeto"
import Cartao from "./pages/Cartao"
import Noticias from "./pages/Noticias"
import Page404 from "./pages/Page404"
import PageBase from "./pages/PageBase"
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import NoticiasDetalhes from "./pages/NoticiasDetalhes";
import WhatsAppButton from "./components/WhatsAppButton"; 
import Ouvidoria from "./pages/Ouvidoria/Ouvidoria";

import Filantropia from "./pages/Filantropia";
import Convenios from "./pages/Convenios";
import CorpoClinico from "./pages/CorpoClinico";
import Duvidas from "./pages/Duvidas";
import TrabalheConosco from "./pages/TrabalheConosco";
import CanalIntegridade from "./pages/Ouvidoria/CanalIntegridade";
import CodigoEtica from "./pages/CodigoEtica/CodigoEtica";


function AppRoutes () {
    return(
       <BrowserRouter>          
                <ScrollToTop />
                   <Routes>
                        <Route path="/" element={<PageBase />}>
                            <Route index element ={<Home />}></Route>
                            <Route path="/*" element ={<Page404 />}></Route>
                            <Route path="/ouvidoria" element={<Ouvidoria />} />
                            <Route path="/fale-conosco/canal-de-integridade" element={<CanalIntegridade />} />
                            <Route path="/sobre" element ={<Sobre />}></Route>
                            <Route path="/especialidades" element ={<Especialidades />}></Route>
                            <Route path="/filantropia" element={<Filantropia />} />
                            <Route path="/igualdade-salarial" element={<Convenios />} />
                            <Route path="/corpo-clinico" element={<CorpoClinico />} />
                            <Route path="/duvidas" element={<Duvidas />} />
                            <Route path="/trabalhe-conosco" element={<TrabalheConosco />} />
                            <Route path="/cartao" element ={<Cartao />}></Route>
                            <Route path="/noticias" element ={<Noticias />}></Route>
                            <Route path="/noticias/:id" element={<NoticiasDetalhes />} />                                                   
                            <Route path="/portal-da-transparencia" element ={<Projeto />}></Route>   
                            <Route path="/codigo-de-etica" element={<CodigoEtica />}/>
                            <Route path="/fale-conosco/canal-de-integridade" element={<CanalIntegridade />}
/>                                                   
                        </Route>                   
                 </Routes>
                 <WhatsAppButton />                      
       </BrowserRouter>
    )
}

export default AppRoutes