import { getFormattedData } from './utils';
import { Title } from '../../atoms/title/title';
import { ArticlesCarousel } from './articles-carousel';
import { Button } from '../../atoms/button/button';
import { QueueListIcon } from '@heroicons/react/24/outline';

export const Articles = async () => {
  const data = await getFormattedData();

  if (data.length === 0) {
    // If something goes wrong with the API, we just don't show the articles section
    return null;
  }

  return (
    <section className='relative mb-28 pb-0 md:py-16'>
      <div className='flex items-center justify-between gap-4 pb-6 md:pb-14'>
        <Title as='h2' variant='medium' className='text-center md:text-left'>
          Blog Highlights
        </Title>

        <Button
          variant='primary'
          className='flex items-center gap-2 whitespace-pre'
          href='https://blog.spiceai.org/'
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='w-5'>
            <QueueListIcon />
          </div>
          View all
        </Button>
      </div>
      <ArticlesCarousel data={data} />
    </section>
  );
};
