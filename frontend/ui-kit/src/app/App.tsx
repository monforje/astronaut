/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { HashRouter, Route, Routes } from "react-router";
import { Shell } from "./Shell";
import { EntryRoute, Home, NotFound } from "./pages";

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path=":id/*" element={<EntryRoute />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
