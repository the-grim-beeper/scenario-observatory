import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navigation from './components/Navigation';
import CubeView from './views/CubeView';
import ScenarioViewComponent from './views/ScenarioView';
import PlaygroundView from './views/PlaygroundView';
import CompareView from './views/CompareView';
import PestleViewComponent from './views/PestleView';
import PopulationViewComponent from './views/PopulationView';

const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const pageTransitionConfig = {
  duration: 0.28,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransitionConfig}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

function TerrainPage() {
  return (
    <PageWrapper>
      <CubeView />
    </PageWrapper>
  );
}

function ScenarioPage() {
  return (
    <PageWrapper>
      <ScenarioViewComponent />
    </PageWrapper>
  );
}

function PlaygroundPage() {
  return (
    <PageWrapper>
      <PlaygroundView />
    </PageWrapper>
  );
}

function ComparePage() {
  return (
    <PageWrapper>
      <CompareView />
    </PageWrapper>
  );
}

function PestlePage() {
  return (
    <PageWrapper>
      <PestleViewComponent />
    </PageWrapper>
  );
}

function PopulationsPage() {
  return (
    <PageWrapper>
      <PopulationViewComponent />
    </PageWrapper>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<TerrainPage />} />
        <Route path="/scenario/:id" element={<ScenarioPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/pestle" element={<PestlePage />} />
        <Route path="/populations" element={<PopulationsPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-full w-full flex flex-col bg-parchment">
        <Navigation />
        <main className="flex-1 overflow-auto topo-contours">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
