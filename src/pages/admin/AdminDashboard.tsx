import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash, Package, Tags, Image as ImageIcon, ShoppingCart, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useQuery, QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';

type Product = Database['public']['Tables']['products']['Row'] & {
  category: Database['public']['Tables']['categories']['Row'];
};

type Category = Database['public']['Tables']['categories']['Row'];

type Order = Database['public']['Tables']['orders']['Row'];

// Create a new QueryClient instance outside the component
const queryClient = new QueryClient();

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'category', id: string } | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDeleteOrderDialogOpen, setIsDeleteOrderDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  // New state to track optimistic updates for order status
  const [optimisticOrderStatus, setOptimisticOrderStatus] = useState({});

  // Query for fetching orders
  const { 
    data: ordersData = [], 
    isLoading: isLoadingOrders, 
    error: ordersError 
  } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
    
        if (error) {
          console.error('Error fetching orders:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in query function:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutation for toggling order status (completed/new)
  const toggleOrderStatusMutation = useMutation({
    mutationFn: async (variables: { orderId: string; currentStatus: string }) => {
      // Toggle between 'completed' and 'new'
      const newStatus = variables.currentStatus === 'completed' ? 'new' : 'completed';
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', variables.orderId)
        .select();
        
      if (error) throw error;
      return { orderId: variables.orderId, newStatus };
    },
    onMutate: ({ orderId, currentStatus }) => {
      // Optimistically update the UI
      const newStatus = currentStatus === 'completed' ? 'new' : 'completed';
      setOptimisticOrderStatus(prev => ({
        ...prev,
        [orderId]: newStatus
      }));
      
      // Show toast for user feedback
      toast.success(`تم تحديث حالة الطلب إلى ${newStatus === 'completed' ? 'مكتمل' : 'جديد'}`);
      return { orderId, prevStatus: currentStatus };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context) {
        setOptimisticOrderStatus(prev => ({
          ...prev,
          [context.orderId]: context.prevStatus
        }));
      }
      toast.error('فشل في تحديث حالة الطلب');
      console.error('Error updating order status:', error);
    },
    onSettled: () => {
      // Refetch orders to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  // Mutation for deleting orders
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
        
      if (error) throw error;
      return orderId;
    },
    onMutate: (orderId) => {
      // Close delete dialog immediately
      setIsDeleteOrderDialogOpen(false);
      setOrderToDelete(null);
      
      // Show immediate feedback
      toast.success('تم حذف الطلب بنجاح');
      return { orderId };
    },
    onError: (error) => {
      toast.error('فشل في حذف الطلب');
      console.error('Error deleting order:', error);
    },
    onSettled: () => {
      // Refetch orders to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            category:categories(*)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'product') {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;
        setProducts(products.filter(p => p.id !== itemToDelete.id));
        toast.success('Product deleted successfully');
      } else {
        // Check if category has products
        const { data: productsInCategory } = await supabase
          .from('products')
          .select('id')
          .eq('category_id', itemToDelete.id);

        if (productsInCategory && productsInCategory.length > 0) {
          toast.error('Cannot delete category with existing products');
          return;
        }

        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;
        setCategories(categories.filter(c => c.id !== itemToDelete.id));
        toast.success('Category deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleAddProduct = () => {
    if (showCategoryForm) {
      setShowCategoryForm(false);
      setEditingCategory(null);
    }
    
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    if (showCategoryForm) {
      setShowCategoryForm(false);
      setEditingCategory(null);
    }
    
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddCategory = () => {
    if (showProductForm) {
      setShowProductForm(false);
      setEditingProduct(null);
    }
    
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategory = (category: Category) => {
    if (showProductForm) {
      setShowProductForm(false);
      setEditingProduct(null);
    }
    
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleFormSuccess = () => {
    setShowProductForm(false);
    setShowCategoryForm(false);
    setEditingProduct(null);
    setEditingCategory(null);
    fetchData();
  };

  const handleCancelProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleCancelCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  // New function to handle toggling order status
  const handleToggleOrderStatus = (order) => {
    const currentStatus = optimisticOrderStatus[order.id] || order.status;
    toggleOrderStatusMutation.mutate({ 
      orderId: order.id, 
      currentStatus 
    });
  };

  // New function to handle deleting an order immediately
  const handleDeleteOrderImmediate = (orderId) => {
    // Show confirmation toast first
    toast.info('جاري حذف الطلب...', { duration: 1000 });
    // Delete immediately
    deleteOrderMutation.mutate(orderId);
  };

  // Helper function to safely parse JSON
  const safeParseItems = (items: any) => {
    try {
      if (Array.isArray(items)) {
        return items;
      } else if (typeof items === 'string') {
        return JSON.parse(items);
      } else if (items && typeof items === 'object') {
        return [items];
      }
      return [];
    } catch (e) {
      console.error('Error parsing items:', e);
      return [];
    }
  };

  // Get effective status (considering optimistic updates)
  const getEffectiveStatus = (order) => {
    return optimisticOrderStatus[order.id] !== undefined 
      ? optimisticOrderStatus[order.id] 
      : order.status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Button onClick={handleAddProduct} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button onClick={handleAddCategory} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {showProductForm && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductForm 
                  initialData={editingProduct || undefined} 
                  onSuccess={handleFormSuccess} 
                  onCancel={handleCancelProductForm}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {showCategoryForm && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryForm 
                  initialData={editingCategory || undefined} 
                  onSuccess={handleFormSuccess} 
                  onCancel={handleCancelCategoryForm}
                />
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="products" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="products">
              <Package className="mr-2 h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tags className="mr-2 h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image_urls && product.image_urls[0] ? (
                            <img
                              src={product.image_urls[0]}
                              alt={product.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category?.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.is_featured ? "default" : "secondary"}>
                            {product.is_featured ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(product.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ type: 'product', id: product.id });
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          {category.image_url ? (
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {category.description}
                        </TableCell>
                        <TableCell>
                          {format(new Date(category.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ type: 'category', id: category.id });
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                  </div>
                ) : ordersError ? (
                  <div className="text-center py-8 text-red-500">
                    <p>حدث خطأ أثناء جلب الطلبات</p>
                    <p className="text-sm mt-2">{(ordersError as Error).message}</p>
                  </div>
                ) : !ordersData?.length ? (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد طلبات حتى الآن
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم الطلب</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>رقم الهاتف</TableHead>
                        <TableHead>المنطقة</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>المنتجات</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData.map((order: any) => {
                        const effectiveStatus = getEffectiveStatus(order);
                        const isCompleted = effectiveStatus === 'completed';
                        
                        return (
                          <TableRow 
                            key={order.id}
                            className={isCompleted ? 'bg-green-50' : ''}
                          >
                            <TableCell className={isCompleted ? 'line-through text-gray-500' : ''}>
                              #{order.id}
                            </TableCell>
                            <TableCell className={isCompleted ? 'line-through text-gray-500' : ''}>
                              {order.first_name || ''} {order.last_name || ''}
                            </TableCell>
                            <TableCell className={isCompleted ? 'line-through text-gray-500' : ''}>
                              {order.phone || 'N/A'}
                            </TableCell>
                            <TableCell className={isCompleted ? 'line-through text-gray-500' : ''}>
                              {order.region || 'N/A'}
                            </TableCell>
                            <TableCell className={isCompleted ? 'line-through text-gray-500' : ''}>
                              {order.total || 0} ريال
                            </TableCell>
                            <TableCell>
                              {effectiveStatus === "new" ? (
                                <Badge 
                                  variant="secondary"
                                  className="cursor-pointer transition-colors duration-200 hover:bg-green-100"
                                  onClick={() => handleToggleOrderStatus(order)}
                                >
                                  جديد
                                </Badge>
                              ) : effectiveStatus === "in_progress" ? (
                                <Badge 
                                  variant="default"
                                  className="cursor-pointer transition-colors duration-200 hover:bg-green-100"
                                  onClick={() => handleToggleOrderStatus(order)}
                                >
                                  قيد التنفيذ
                                </Badge>
                              ) : effectiveStatus === "completed" ? (
                                <Badge 
                                  variant="outline"
                                  className="bg-green-100 cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                                  onClick={() => handleToggleOrderStatus(order)}
                                >
                                  مكتمل
                                </Badge>
                              ) : (
                                <Badge variant="secondary">غير معروف</Badge>
                              )}
                            </TableCell>
                            <TableCell className={isCompleted ? 'line-through text-gray-500' : ''}>
                              {order.created_at ? format(new Date(order.created_at), "dd/MM/yyyy HH:mm") : 'N/A'}
                            </TableCell>
                            <TableCell className={isCompleted ? 'line-through text-gray-500' : ''}>
                              <div className="space-y-1">
                                {(() => {
                                  const items = safeParseItems(order.items);
                                  return items.length > 0 ? (
                                    items.map((item: any, index: number) => (
                                      <div key={`${item.product_id || index}`} className="text-sm">
                                        {item.name || 'Unnamed Product'} × {item.quantity || 1}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-gray-500">No items data</div>
                                  );
                                })()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleOrderStatus(order)}
                                  className={`transition-colors ${
                                    isCompleted 
                                      ? 'text-gray-600 hover:text-gray-700 border-gray-300' 
                                      : 'text-green-600 hover:text-green-700 border-green-200 hover:border-green-300'
                                  }`}
                                  title={isCompleted ? 'تحديث الحالة إلى جديد' : 'تحديث الحالة إلى مكتمل'}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteOrderImmediate(order.id)}
                                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                  title="حذف الطلب"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Export the component wrapped with the QueryClientProvider
export default function AdminDashboardWithQueryClient() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}