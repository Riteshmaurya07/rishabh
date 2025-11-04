import { Link } from "react-router-dom";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";

const AllProducts = () => {
  const { data: products, isLoading, isError } = useAllProductsQuery();

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (isError) return <div className="text-center text-red-500 py-10">Error loading products</div>;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  return (
    <div className="container mx-auto px-4 xl:px-[9rem]">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-3/4 p-3">
          <h2 className="text-2xl font-bold mb-6">All Products ({products?.length ?? 0})</h2>

          <div className="grid grid-cols-1 gap-6">
            {products && products.length > 0 ? (
              products.map((product) => (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row bg-[#1a1a1a] rounded-lg overflow-hidden shadow-md"
              >
                <img
                  src={product.image || "/images/default-product.png"}
                  alt={product.name || "product image"}
                  className="w-full sm:w-[10rem] h-[10rem] object-cover"
                />

                <div className="flex flex-col justify-between p-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                    <p className="text-gray-400 text-sm">{formatDate(product.createdAt)}</p>
                  </div>

                  <p className="text-gray-400 text-sm mt-2 mb-4 max-w-[40rem]">
                    {product.description
                      ? product.description.length > 160
                        ? `${product.description.substring(0, 160)}...`
                        : product.description
                      : ""}
                  </p>

                  <div className="flex justify-between items-center">
                    <Link
                      to={`/admin/product/update/${product._id}`}
                      aria-label={`Update ${product.name}`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      Update Product
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                    <p className="text-white font-semibold">$ {product.price?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-6">No products found</div>
            )}
          </div>
        </div>

        <div className="md:w-1/4 p-3 mt-6 md:mt-0">
          <AdminMenu />
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
