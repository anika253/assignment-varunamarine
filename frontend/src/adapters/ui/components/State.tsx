type StateProps = {
  title: string;
  message?: string;
};

export const LoadingState = ({ title, message }: StateProps) => (
  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 text-center text-slate-300">
    <div className="mx-auto mb-2 h-12 w-12 animate-spin rounded-full border-2 border-brand border-t-transparent" />
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {message && <p className="mt-2 text-sm text-slate-400">{message}</p>}
  </div>
);

export const ErrorState = ({ title, message }: StateProps) => (
  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
    <h3 className="text-lg font-semibold text-red-200">{title}</h3>
    {message && <p className="mt-2 text-sm text-red-300">{message}</p>}
  </div>
);
