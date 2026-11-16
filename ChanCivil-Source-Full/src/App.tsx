import { Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import About from './pages/About';
import Admin from './pages/Admin';
import ArticleDetail from './pages/ArticleDetail';
import Articles from './pages/Articles';
import Contact from './pages/Contact';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Resources from './pages/Resources';
import Tools from './pages/Tools';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="tools" element={<Tools />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:slug" element={<ArticleDetail />} />
        <Route path="resources" element={<Resources />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
