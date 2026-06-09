import { Link } from 'react-router-dom';

function DashboardNavItem({
  item,
  isActive,
  disabled = false,
  activeClassName = 'bg-[#003971]/10 text-[#003971]',
  inactiveClassName = 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
  onNavigate,
}) {
  const baseClassName = `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
    isActive ? activeClassName : inactiveClassName
  }`;

  const iconClassName = `h-5 w-5 mr-3 ${isActive ? 'text-[#003971]' : 'text-gray-400'}`;

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${baseClassName} opacity-45 cursor-not-allowed pointer-events-none select-none`}
      >
        <item.icon className={iconClassName} />
        {item.name}
      </span>
    );
  }

  return (
    <Link to={item.path} className={baseClassName} onClick={onNavigate}>
      <item.icon className={iconClassName} />
      {item.name}
    </Link>
  );
}

export default DashboardNavItem;
