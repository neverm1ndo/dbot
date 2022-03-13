export function autoscroll (element) {
  element.scrollTo({
    top: element.scrollHeight + 300,
    behavior: 'smooth'
  });
}
