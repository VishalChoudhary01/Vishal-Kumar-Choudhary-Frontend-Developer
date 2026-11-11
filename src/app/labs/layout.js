export default function LabsLayout({ children, authModal }) {
  return (
    <div data-labs-ui="" className="contents">
      {children}
      {authModal}
    </div>
  );
}
