import { useState } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";

import { toast } from "react-toastify";
import CategoryForm from "../../components/CategoryForm";
import Modal from "../../components/Modal";
import AdminMenu from "./AdminMenu";

const CategoryList = () => {
  const { data: categories, isLoading, isError } = useFetchCategoriesQuery();
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const result = await createCategory({ name }).unwrap();
      setName("");
      toast.success(`${result.name} created successfully`);
    } catch (error) {
      toast.error(error?.data?.message || "Creating category failed");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!updatingName.trim()) {
      toast.error("Updated name is required");
      return;
    }

    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: { name: updatingName },
      }).unwrap();

      toast.success(`${result.name} updated successfully`);
      setSelectedCategory(null);
      setUpdatingName("");
      setModalVisible(false);
    } catch (error) {
      toast.error(error?.data?.message || "Updating category failed");
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap();
      toast.success(`${result.name} deleted successfully`);
      setSelectedCategory(null);
      setModalVisible(false);
    } catch (error) {
      toast.error(error?.data?.message || "Deleting category failed");
    }
  };

  return (
    <div className="flex flex-col md:flex-row px-4 md:px-[10rem]">
      <AdminMenu />
      <div className="md:w-3/4 p-3">
        <h2 className="text-xl font-bold mb-4">Manage Categories</h2>

        <CategoryForm
          value={name}
          setValue={setName}
          handleSubmit={handleCreateCategory}
          submitDisabled={creating}
        />

        <hr className="my-6" />

        {isLoading ? (
          <p>Loading categories...</p>
        ) : isError ? (
          <p className="text-red-500">Error loading categories</p>
        ) : (
          <div className="flex flex-wrap">
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category._id}
                  aria-label={`Edit ${category.name}`}
                  className="bg-white border border-pink-500 text-pink-500 py-2 px-4 rounded-lg m-3 hover:bg-pink-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
                  onClick={() => {
                    setModalVisible(true);
                    setSelectedCategory(category);
                    setUpdatingName(category.name);
                  }}
                >
                  {category.name}
                </button>
              ))
            ) : (
              <div className="text-gray-500 p-4">No categories found</div>
            )}
          </div>
        )}

        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
          <CategoryForm
            value={updatingName}
            setValue={setUpdatingName}
            handleSubmit={handleUpdateCategory}
            buttonText="Update"
            handleDelete={handleDeleteCategory}
            submitDisabled={updating}
            deleteDisabled={deleting}
          />
        </Modal>
      </div>
    </div>
  );
};

export default CategoryList;
