import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  getBlogsByCategory,
  getCategory,
} from '@/lib/microcms';
import BlogItem from '@/components/BlogItem';
import NoResults from '@/components/NoResults';
import Head from 'next/head';
import { Blog, Category } from '@/lib/types';

interface CategoryListProps {
  setIsLoading: (isLoading: boolean) => void;
}

/**
 * カテゴリに基づいてブログを表示するコンポーネント
 * URLのカテゴリIDに基づいてMicroCMSからブログ情報とカテゴリ情報を取得します。
 * ページネーション対応で、ブログがない場合は適切なメッセージを表示します。
 *
 * @param {object} props - コンポーネントのプロパティ.
 * @returns {JSX.Element}
 *   カテゴリに基づいたブログリストを表示するReactコンポーネント.
 */
const CategoryList: React.FC<
  CategoryListProps
> = ({ setIsLoading }) => {
  const router = useRouter();
  const { categoryId } = router.query;

  // ブログ、カテゴリ情報、ページネーション用のステート管理
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [category, setCategory] =
    useState<Category | null>(null);
  const [currentPage, setCurrentPage] =
    useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 1ページあたりのブログ表示数
  const blogsPerPage = 10;

  /**
   * カテゴリに基づいたブログを取得し、現在のページに対応するブログを表示
   * ページネーションのために総ページ数を計算.
   *
   * @param {number} page - 現在のページ番号.
   */
  useEffect(() => {
    const fetchBlogs = async (page: number) => {
      if (!categoryId) return;

      setIsLoading(true); // ローディング状態を表示
      const data = await getBlogsByCategory(
        categoryId as string,
        page,
        blogsPerPage,
      );
      setBlogs(data.contents); // ブログデータをステートにセット
      setTotalPages(
        Math.ceil(data.totalCount / blogsPerPage),
      ); // 総ページ数を計算
      setIsLoading(false); // ローディング状態を解除
    };

    /** カテゴリIDに基づいてカテゴリ詳細を取得. */
    const fetchCategory = async () => {
      if (!categoryId) return;

      const data = await getCategory(
        categoryId as string,
      );
      setCategory(data); // カテゴリ情報をステートにセット
    };

    fetchBlogs(currentPage);
    fetchCategory();
  }, [categoryId, setIsLoading, currentPage]);

  /**
   * ページ変更時にページ番号を設定します。
   *
   * @param {number} page - 新しいページ番号.
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="blog-container">
      <Head>
        <title>
          {category ?
            `${category.name} のカテゴリ`
          : 'カテゴリ'}{' '}
          | iU 学友会
        </title>
        <meta
          name="description"
          content={
            category ? category.explanation : ''
          }
        />
        <meta
          name="keywords"
          content={`学友会, ${category ? category.name : ''}`}
        />
      </Head>

      <h1>{category ? category.name : ''}</h1>

      {category &&
        (category.explanation ||
          category.image) && (
          <div className="category-info">
            {category.explanation && (
              <div className="category-description">
                <p>{category.explanation}</p>
              </div>
            )}
            {category.image && (
              <div className="category-image">
                <img
                  src={category.image.url}
                  alt={category.name}
                />
              </div>
            )}
          </div>
        )}

      {blogs.length === 0 ?
        <NoResults
          query={
            category ?
              category.name
            : 'このカテゴリ'
          }
        />
      : <ul className="blog-list">
          {blogs.map((blog) => (
            <BlogItem key={blog.id} blog={blog} />
          ))}
        </ul>
      }

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from(
            { length: totalPages },
            (_, index) => (
              <button
                key={index + 1}
                onClick={() =>
                  handlePageChange(index + 1)
                }
                className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
