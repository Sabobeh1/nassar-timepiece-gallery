
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryFormProps {
  initialData?: Category;
  onSuccess?: () => void;
}

export const CategoryForm = ({ initialData, onSuccess }: CategoryFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url || null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        if (uploadError.message.includes('duplicate')) {
          // If file already exists, generate a new name
          const newFileName = `${Math.random()}-${fileName}`;
          const newFilePath = `categories/${newFileName}`;
          
          const { data: retryData, error: retryError } = await supabase.storage
            .from('images')
            .upload(newFilePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (retryError) {
            console.error('Retry upload error:', retryError);
            throw retryError;
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(newFilePath);
          
          setImageUrl(publicUrl);
          setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } else {
          throw uploadError;
        }
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        
        setImageUrl(publicUrl);
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);

        if (error) throw error;
        toast.success('Category created successfully');
      }

      // Only navigate if onSuccess isn't provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Instead of navigating elsewhere, ensure we go to the dashboard
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? 'Edit Category' : 'Add New Category'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Category Image</Label>
              <div className="grid grid-cols-2 gap-4">
                {imageUrl ? (
                  <div className="relative group">
                    <img
                      src={imageUrl}
                      alt="Category"
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}
                <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-32 cursor-pointer hover:border-gold transition-colors">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-8 w-8 text-gray-400" />
                    <span className="mt-2 block text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Add Image'}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading ? 'Saving...' : initialData ? 'Update Category' : 'Save Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
