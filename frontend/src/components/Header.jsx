const Header = () => {
  return (
    <header className="bg-blue-600 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-xl font-bold">StudyFlow</h1>
        <div className="flex items-center space-x-2">
          <span>Mohit Lamba</span>
          <div className="w-8 h-8 bg-gray-200 text-black rounded-full flex items-center justify-center">
            ML
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
