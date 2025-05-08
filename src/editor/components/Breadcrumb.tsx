const Breadcrumb = () => {
  // TODO: Zustand para hierarquia do elemento selecionado
  return (
    <nav className="flex gap-2 p-2 bg-gray-100 text-xs">
      {/* Exemplo: <body> / <div> / <section> / <button> */}
      <span>&lt;body&gt;</span>
      <span>/</span>
      <span>&lt;div&gt;</span>
      <span>/</span>
      <span>&lt;section&gt;</span>
      <span>/</span>
      <span>&lt;button&gt;</span>
    </nav>
  );
};

export default Breadcrumb; 