export type HeroPlaygroundData = {
  title: string
  description: string
  code: React.ReactElement<HTMLElement>
  requestUrl: string
}

export const heroPlaygroundData: HeroPlaygroundData[] = [
  {
    title: 'Recent NFT Mints',
    description: 'Retrieve the 100 most recent NFT mints in Ethereum.',
    code: (
      <code className='text-sm leading-6'>
        <span className='text-red-400'>SELECT</span> token_address, token_id, to_address,
        UNIX_TIMESTAMP() - block_timestamp <span className='text-red-400'>as</span> seconds_ago
        <span className='text-red-400'> FROM</span> eth.recent_nft_mints
      </code>
    ),
    requestUrl: 'recent_nft_mints'
  },
  {
    title: 'Recent Ethereum Blocks',
    description: 'Discover core information about the 10 most recent Ethereum blocks.',
    code: (
      <code className='text-sm leading-6'>
        <span className='text-red-400'>SELECT</span> number, "timestamp", hash, transaction_count,
        gas_used
        <br />
        <span className='text-red-400'> FROM</span> eth.recent_blocks
      </code>
    ),
    requestUrl: 'recent_ethereum_blocks'
  },
  {
    title: 'OpenSea NFT Sales Across Ethereum/Polygon',
    description:
      'Compare the number of NFTs being sold in a five-minute window across both Polygon and Ethereum.',
    code: (
      <code className='text-sm leading-6'>
        <span className='text-red-400'>SELECT</span> chain,{' '}
        <span className='text-red-400'>count</span>(*) as nft_sales, TO_TIMESTAMP((block_timestamp /{' '}
        <span className='text-red-400'>300</span>) * <span className='text-red-400'>300</span>){' '}
        <span className='text-red-400'>as</span> time_window <span className='text-red-400'></span>
        FROM nft.recent_sales <br />
        <span className='text-red-400'>GROUP BY </span>
        time_window, chain <br />
        <span className='text-red-400'>ORDER BY</span> time_window{' '}
        <span className='text-red-400'>desc</span>
      </code>
    ),
    requestUrl: 'opensea_sales'
  },
  {
    title: 'Average Transaction Fees for Ethereum',
    description:
      'See the recent average transaction fees paid to include a transaction in the Ethereum network.',
    code: (
      <code className='text-sm leading-6'>
        <span className='text-red-400'>SELECT</span> block_number, TO_TIMESTAMP(block_timestamp){' '}
        <span className='text-red-400'>as</span> block_timestamp,{' '}
        <span className='text-red-400'>avg</span>(gas) <span className='text-red-400'>as</span>{' '}
        avg_gas_used,
        <span className='text-red-400'> avg</span>(gas_price /{' '}
        <span className='text-red-400'>1e9</span>) <span className='text-red-400'>as</span>{' '}
        avg_gas_price_in_gwei, <span className='text-red-400'>avg</span>(gas * (gas_price /{' '}
        <span className='text-red-400'>1e18</span>)) <span className='text-red-400'>as</span>{' '}
        avg_fee_in_eth <br /> <span className='text-red-400'>FROM</span> eth.recent_transactions{' '}
        <br />
        <span className='text-red-400'>GROUP BY</span> block_number, block_timestamp
      </code>
    ),
    requestUrl: 'average_ethereum_transaction_fee'
  },
  {
    title: 'Total Bitcoin Transferred by Block Number',
    description:
      'See the recent average transaction fees paid to include a transaction in the Ethereum network.',
    code: (
      <code className='text-sm leading-6'>
        <span className='text-red-400'>SELECT</span> block_number, SUM(output_value) / 1e8 as
        btc_transferred avg_fee_in_eth <br /> <span className='text-red-400'>FROM</span>{' '}
        btc.recent_transactions <br />
        <span className='text-red-400'>GROUP BY</span> block_number
      </code>
    ),
    requestUrl: 'total_bitcoin_transferred'
  }
]
