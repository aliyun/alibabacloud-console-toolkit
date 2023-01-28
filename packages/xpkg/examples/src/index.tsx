import * as React from 'react';
import styles from './index.module.css';

interface ComponentProps {
  /** Title for ExampleComponent. */
  title: string;
}

export default function ExampleComponent(props: ComponentProps) {
  const { title = 'Hello World!' } = props;

  return (
    <div className={styles.container}>{title}</div>
  );
}
