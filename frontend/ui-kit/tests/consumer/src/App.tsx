/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import {
  Avatar,
  Button,
  DataTable,
  Dialog,
  Loader,
  Select,
  Toaster,
  toast,
  type DataTableColumn,
} from "@astronaut/ui-kit";

interface Cargo {
  id: string;
  weight: number;
}

const rows: Cargo[] = [
  { id: "MSKU-1", weight: 1200 },
  { id: "MSKU-2", weight: 800 },
];

const columns: DataTableColumn<Cargo>[] = [
  { id: "id", header: "Контейнер", cell: (r) => r.id },
  { id: "weight", header: "Вес, кг", align: "end", cell: (r) => r.weight },
];

const options = [
  { value: "a", label: "Первый" },
  { value: "b", label: "Второй" },
];

export function App() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("a");
  return (
    <main>
      <Button onClick={() => setOpen(true)}>Открыть окно</Button>
      <Button variant="outline" onClick={() => toast({ title: "Готово" })}>
        Тост
      </Button>
      <Select label="Выбор" options={options} value={value} onValueChange={setValue} />
      <DataTable<Cargo> label="Грузы" columns={columns} rows={rows} getRowId={(r) => r.id} />
      <Avatar kind="agent" size="md" />
      <Loader label="Загружаем" />
      <Dialog open={open} onOpenChange={setOpen} title="Окно">
        Содержимое окна
      </Dialog>
      <Toaster />
    </main>
  );
}
