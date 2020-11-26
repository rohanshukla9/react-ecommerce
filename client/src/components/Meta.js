import React from 'react'
import { Helmet } from 'react-helmet'

const Meta = ({ title, keywords, description }) => {
  return (
    <div>
      <Helmet>
          <title>{title}</title>
          <meta name='description' content={description} />
          <meta name='keyword' content={keywords} />
         
      </Helmet>
      
    </div>
  )
}

Meta.defaultProps = {
  title: 'Welcome to Bharuch Kirana',
  description: 'We deliver best Kirana at your doorstep',
  keywords: 'Groceries, bharuch online, bharuch, bharuch store, buy bharuch'
}

export default Meta
