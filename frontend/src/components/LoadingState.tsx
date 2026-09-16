interface LoadingStateProps {
  label?: string;
  fullPage?: boolean;
}

export const LoadingState = ({ label = 'Curating the edit', fullPage = false }: LoadingStateProps) => (
  <div className={fullPage ? 'loading-state loading-state--full' : 'loading-state'} role="status">
    <span className="loading-orb" />
    <span>{label}</span>
  </div>
);
