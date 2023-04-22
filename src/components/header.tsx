export const Header = () => (
  <div className="w-full bg-white shadow-lg px-5 py-2 flex gap-2 items-center">
    <img src="/assets/icon.svg" className="h-5 w-5 mt-[1px]" />
    <h1 className="text-xl">
      <a href="/">
        {/* <span className="font-bold text-main">exam</span>
        <span className="text-gray-500">pack</span> */}
        <span className="text-gray-500">exam</span>
        <span className="font-bold text-main">.blue</span>
      </a>
    </h1>
  </div>
);
