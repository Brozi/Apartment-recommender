export type NavPaginationModel = {
  type: "nav";
  currentIndex: number;
  totalSteps: number;
  label: string;
  prevPath: string;
  nextPath: string;
};

export type ActionPaginationModel = {
  type: "action";
  currentIndex: number;
  totalSteps: number;
  label: string;
  onPrev: () => void;
  onNext: () => void;
};

export type PaginationModel = NavPaginationModel | ActionPaginationModel;
