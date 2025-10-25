import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Review {
  _id: string;
  text: string;
  images: string[];
  userId: { _id: string; name: string };
  createdAt: string;
  status: string;
}

interface ReviewsListProps {
  productId: string;
  refreshTrigger?: number;
}

export const ReviewsList = ({ productId, refreshTrigger = 0 }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const cacheKey = `?v=${Date.now()}`;
        const { ok, json } = await api(`/api/reviews?productId=${productId}&status=published&page=${page}&limit=10${cacheKey}`);

        if (!ok) {
          throw new Error(json?.message || 'Failed to load reviews');
        }

        setReviews(json.data || []);
        setTotalPages(json.pagination?.pages || 0);
      } catch (err: any) {
        setError(err?.message || 'Failed to load reviews');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    setPage(1);
    fetchReviews();
  }, [productId, refreshTrigger]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const cacheKey = `?v=${Date.now()}`;
        const { ok, json } = await api(`/api/reviews?productId=${productId}&status=published&page=${page}&limit=10${cacheKey}`);

        if (ok) {
          setReviews(json.data || []);
          setTotalPages(json.pagination?.pages || 0);
        }
      } catch {}
      finally {
        setLoading(false);
      }
    };

    if (page > 1) {
      fetchReviews();
    }
  }, [page, productId]);

  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-muted rounded w-full animate-pulse" />
            <div className="h-3 bg-muted rounded w-5/6 animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (error && page === 1) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review._id} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-semibold text-sm">{review.userId?.name || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <p className="text-sm text-foreground whitespace-pre-wrap break-words">{review.text}</p>

          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {review.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="aspect-square rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity"
                >
                  <img
                    src={img}
                    alt={`Review image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedImage}
              alt="Review"
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
