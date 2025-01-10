import React from 'react';
import Layout from '@theme/Layout';

import {getArticlesData, ProcessedFile} from '../lib/articles'
import { Cta } from '../components/molecules/cta/cta';
import { Install } from '../components/organisms/install/install';
import { Container } from '../components/atoms/container/container';
import { Features } from '../components/organisms/features/features';
import { Articles } from '../components/organisms/articles/articles';
import { UseCases } from '../components/organisms/use-cases/use-cases';
import { BeforeAndAfter } from '../components/organisms/before-and-after/before-and-after';
import { HeroPlayground } from '../components/organisms/hero-playground/hero-playground';

export default function LandingPage() {
  const [articles, setArticles] = React.useState<ProcessedFile[]>([])

  React.useEffect(() => {
    getArticlesData().then((data) => {
      setArticles(data)
    })
  }, [])

  return (
    <Layout
      title='Spice.ai OSS'
      description='Spice is an open-source SQL query and AI compute engine, built in Rust, for developers.'
      wrapperClassName='tailwind'
    >
      <HeroPlayground />

      <Container>
        <Features />
      </Container>

      <BeforeAndAfter />

      <Container>
        <UseCases />
      </Container>

      <Container>
        <Install />
        <Articles data={articles} />
      </Container>

      <Cta />
    </Layout>
  );
}
