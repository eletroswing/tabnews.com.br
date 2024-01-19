import { useRouter } from 'next/router';
import { getStaticPropsRevalidate } from 'next-swr';
import { useEffect, useState } from 'react';

import { ContentList, DefaultLayout, UserHeader } from '@/TabNewsUI';
import { FaUser } from '@/TabNewsUI/icons';
import { NotFoundError } from 'errors';
import authorization from 'models/authorization.js';
import user from 'models/user.js';
import { useUser } from 'pages/interface';

export default function SavedContent({ username }) {
  const perPage = 30;

  const {
    query: { page },
    push,
  } = useRouter();

  const { isLoading } = useUser();

  const [pagination, setPagination] = useState({});

  const [contentListFound, setContentListFound] = useState([]);

  useEffect(() => {
    async function redirect(path) {
      await push(path);
    }

    const savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];
    const totalPages = Math.ceil(savedPosts.length / perPage);

    const currentPage = Number(page) < 1 ? 1 : Number(page) > totalPages ? totalPages : Number(page);

    if (Number(page) < 1) redirect(`/${username}/salvos/1`);
    if (Number(page) > totalPages) redirect(`/${username}/salvos/${totalPages}`);

    setPagination({
      currentPage,
      totalRows: savedPosts.length,
      perPage,
      firstPage: 1,
      nextPage: currentPage >= totalPages ? undefined : currentPage + 1,
      previousPage: currentPage <= 1 ? undefined : currentPage - 1,
      lastPage: totalPages,
    });

    setContentListFound(savedPosts.slice((currentPage - 1) * perPage, currentPage * perPage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, page]);

  return (
    <DefaultLayout metadata={{ title: `Salvos · Página ${pagination.currentPage || ''} · ${username}` }}>
      <UserHeader username={username} saveContentCount={pagination.totalRows} />

      <ContentList
        contentList={contentListFound}
        pagination={pagination}
        paginationBasePath={`/${username}/salvos`}
        emptyStateProps={{
          isLoading: isLoading,
          title: 'Nenhum conteúdo salvo encontrado neste dispositivo.',
          description: `Você ainda não salvou nenhuma publicação.`,
          icon: FaUser,
        }}
      />
    </DefaultLayout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}
export const getStaticProps = getStaticPropsRevalidate(async (context) => {
  const userTryingToGet = user.createAnonymous();

  let secureUserFound;

  try {
    const userFound = await user.findOneByUsername(context.params.username);

    secureUserFound = authorization.filterOutput(userTryingToGet, 'read:user', userFound);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        notFound: true,
        revalidate: 1,
      };
    }

    throw error;
  }

  return {
    props: {
      username: secureUserFound.username,
    },

    revalidate: 10,
  };
});
