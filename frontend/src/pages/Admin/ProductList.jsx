import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProductMutation } from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const ProductList = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("");

  const navigate = useNavigate();

  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [uploading, setUploading] = useState(false); // local flag for preview upload (we use object URL)
  const { data: categories } = useFetchCategoriesQuery();

  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // create a local preview URL to avoid uploading twice (we'll send the file on form submit)
    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(previewUrl);

    // revoke the object URL later when a new file is selected or on unmount
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price || !category || !imageFile) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const productData = new FormData();
      productData.append("image", imageFile);
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", Number(price));
      productData.append("category", category);
      productData.append("quantity", Number(quantity));
      productData.append("brand", brand);
      productData.append("countInStock", Number(stock));

      const data = await createProduct(productData).unwrap();
      toast.success(`${data.name} created successfully`);
      // reset form
      setImageFile(null);
      setImageUrl(null);
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setQuantity("");
      setBrand("");
      setStock("");

      navigate("/admin/productlist");
    } catch (error) {
      toast.error(error?.data?.message || "Product creation failed");
    }
  };

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0]">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="md:w-3/4 p-3">
          <h2 className="text-xl font-bold mb-4">Create Product</h2>

          {imageUrl && (
            <div className="text-center mb-4">
              <img
                src={imageUrl}
                alt="product preview"
                className="block mx-auto max-h-[200px]"
              />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-semibold mb-2">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={uploadFileHandler}
                className="block w-full text-white border rounded-lg p-2 bg-[#101011]"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex-1">
                <label htmlFor="name" className="block mb-1">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="price" className="block mb-1">Price</label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex-1">
                <label htmlFor="quantity" className="block mb-1">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="brand" className="block mb-1">Brand</label>
                <input
                  id="brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block mb-1">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border rounded-lg bg-[#101011] text-white"
              />
            </div>

            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex-1">
                <label htmlFor="stock" className="block mb-1">Count In Stock</label>
                <input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="category" className="block mb-1">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                >
                  <option value="">Choose Category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || uploading}
              className="py-3 px-6 mt-6 rounded-lg text-lg font-bold bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
