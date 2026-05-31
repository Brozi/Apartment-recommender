import { useMemo } from "react";
import { create } from "zustand";
import type { MapOffersInPoint } from "#/lib/types";
import type { PaginationModel } from "#/store/paginationModels";

type OfferPaginationState = {
  index: number;
  setIndex: (index: number) => void;
  reset: () => void;
};

export const useOfferPagination = create<OfferPaginationState>((set) => ({
  index: 0,
  setIndex: (index) => set({ index }),
  reset: () => set({ index: 0 }),
}));

type OfferPaginationInput = {
  offerIDs: string[];
  selectedOfferId: string | null;
  selectedOffersInPoint: MapOffersInPoint | null;
  label?: string;
};

type OfferPaginationResult = {
  currentOfferId: string | null;
  pagination: PaginationModel | null;
};

export function useOfferPaginationModel({
  offerIDs,
  selectedOfferId,
  selectedOffersInPoint,
  label = "Offer",
}: OfferPaginationInput): OfferPaginationResult {
  const index = useOfferPagination((state) => state.index);
  const setIndex = useOfferPagination((state) => state.setIndex);

  const totalSteps = selectedOffersInPoint?.count ?? 0;
  const currentIndex = Math.min(index, Math.max(totalSteps - 1, 0));

  const currentOfferId = useMemo(() => {
    if (selectedOffersInPoint) {
      return offerIDs[currentIndex] ?? selectedOffersInPoint.firstOfferID;
    }
    return selectedOfferId;
  }, [selectedOfferId, selectedOffersInPoint, offerIDs, currentIndex]);

  const handlePrev = () => {
    if (!totalSteps) return;
    setIndex(Math.max(currentIndex - 1, 0));
  };

  const handleNext = () => {
    if (!totalSteps) return;
    setIndex(Math.min(currentIndex + 1, totalSteps - 1));
  };

  const showPagination = Boolean(selectedOffersInPoint && totalSteps > 1);
  const pagination: PaginationModel | null = showPagination
    ? {
        type: "action",
        currentIndex: currentIndex + 1,
        totalSteps,
        label,
        onPrev: handlePrev,
        onNext: handleNext,
      }
    : null;

  return { currentOfferId, pagination };
}
