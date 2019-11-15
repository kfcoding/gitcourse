import * as git from "isomorphic-git";
const dir=encodeURIComponent(window.location.hash.substr(1));

export function endWith(string,data) {
  var regex=new RegExp(`${data}$`);
  return regex.test(string);
}

export async function visitDir(fs, path){
  let itemsCurrent=[];
  const files=await fs.readdir(path);
  for (const child of files) {
    const currentPath = `${path}/${child}`;
    let node = {"path": currentPath,"title":child,"key":currentPath};
    const info=await fs.stat(currentPath);
    if (info.isDirectory()) {
      const children=await visitDir(fs, currentPath);
      if(children){
        node["children"] =children;
      }
      else{
        node["isLeaf"]=true
      }
      node["type"] = "folder";
    } else {
      node["type"] = "file";
      node["isLeaf"]=true;
      if(endWith(child,".md")){
        node["language"]="markdown";
      }
      else if(endWith(child,".js")){
        node["language"]="javascript";
      }
      else if(endWith(child,".sh")){
        node["language"]="shell";
      }
      else if(endWith(child,".json")){
        node["language"]="json";
      }
      else{
        node["language"]="markdown";
      }
    }
    itemsCurrent.push(node);
  }
  return itemsCurrent;
}

export async function visitDirModified(fs, path){
  let itemsCurrent=[];
  const files=await fs.readdir(path);
  for (const child of files) {
    const currentPath = `${path}/${child}`;
    let node = {"path": currentPath,"title":child,"key":currentPath};
    const info=await fs.stat(currentPath);
    if (info.isDirectory()) {
      if(child==='.git'){
        continue
      }
      const children=await visitDirModified(fs, currentPath);
      if(children){
        node["children"] =children;
      }
      else{
        node["isLeaf"]=true
      }
      node["type"] = "folder";
      if (JSON.stringify(children) !== "[]") {
        itemsCurrent.push(node);
      }
    } else {
      const filePath=currentPath.replace(`${dir}/`,"");
      const status = await git.status({dir:dir,filepath: filePath});
      node["type"] = "file";
      node["isLeaf"]=true;
      if(endWith(child,".md")){
        node["language"]="markdown";
      }
      else if(endWith(child,".js")){
        node["language"]="javascript";
      }
      else if(endWith(child,".sh")){
        node["language"]="shell";
      }
      else if(endWith(child,".json")){
        node["language"]="json";
      }
      else{
        node["language"]="markdown";
      }
      if (status !== "unmodified") {
        itemsCurrent.push(node);
      }
    }
  }
  return itemsCurrent;
}

export function timeStamp2Date(timestamp) {
  const datetime = new Date(parseInt(timestamp) * 1000);
  return datetime.toLocaleString('chinese',{hour12:false})
}