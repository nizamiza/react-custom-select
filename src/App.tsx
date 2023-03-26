import Select from "./components/Select";

const FRUITS = [
  {
    label: "Banana 🍌",
    value: {
      id: "🍌",
      type: "fruit",
      name: "Banana",
    },
  },
  {
    label: "Orange 🍊",
    value: {
      id: "🍊",
      type: "fruit",
      name: "Orange",
    },
  },
  {
    label: "Kiwi 🥝",
    value: {
      id: "🥝",
      type: "fruit",
      name: "Kiwi",
    },
  },
  {
    label: "Pineapple 🍍",
    value: {
      id: "🍍",
      type: "fruit",
      name: "Pineapple",
    },
  },
];

function App() {
  return (
    <main>
      <Select
        defaultOption={FRUITS[2].value}
        options={FRUITS}
        onChange={(value) => {
          console.log(value);
        }}
      />
    </main>
  );
}

export default App;
